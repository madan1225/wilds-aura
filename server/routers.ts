import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getAllPostsAdmin,
  getComments,
  getLikeCounts,
  hasUserLiked,
  toggleLike,
  updatePost,
} from "./db";
import { storagePut } from "./storage";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

function extractYoutubeId(url: string): string | null {
  const pattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/;
  const match = url.match(pattern);
  return match?.[1] ?? null;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  posts: router({
    listWithStats: publicProcedure
      .input(z.object({ category: z.string().optional(), sessionId: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const allPosts = await getAllPosts(input?.category);
        if (allPosts.length === 0) return [];
        const postIds = allPosts.map((p) => p.id);
        const likeCounts = await getLikeCounts(postIds);
        const likedMap: Record<number, boolean> = {};
        for (const postId of postIds) {
          likedMap[postId] = await hasUserLiked(postId, ctx.user?.id, input?.sessionId);
        }
        return allPosts.map((p) => ({
          ...p,
          likeCount: likeCounts[p.id] ?? 0,
          liked: likedMap[p.id] ?? false,
        }));
      }),

    comments: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return getComments(input.postId);
      }),
  }),

  visitor: router({
    toggleLike: publicProcedure
      .input(z.object({ postId: z.number(), sessionId: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const liked = await toggleLike(input.postId, ctx.user?.id, input.sessionId);
        return { liked };
      }),

    addComment: publicProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1).max(1000),
        guestName: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await addComment(input.postId, input.content, ctx.user?.id, input.guestName);
        return { success: true };
      }),
  }),

  admin: router({
    listPosts: adminProcedure.query(async () => {
      return getAllPostsAdmin();
    }),

    createPhotoPost: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        caption: z.string().optional(),
        category: z.enum(["wildlife", "landscape", "street", "other"]),
        location: z.string().optional(),
        imageData: z.string(),
        imageMime: z.string().default("image/jpeg"),
        imageFileName: z.string().default("photo.jpg"),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.imageData, "base64");
        const key = `wilds-aura/photos/${Date.now()}-${input.imageFileName}`;
        const { url } = await storagePut(key, buffer, input.imageMime);
        await createPost({
          type: "photo",
          title: input.title,
          caption: input.caption,
          category: input.category,
          imageUrl: url,
          imageKey: key,
          location: input.location,
        });
        return { success: true, url };
      }),

    createVideoPost: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        caption: z.string().optional(),
        category: z.enum(["wildlife", "landscape", "street", "other"]),
        location: z.string().optional(),
        youtubeUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        const youtubeId = extractYoutubeId(input.youtubeUrl);
        if (!youtubeId) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid YouTube URL" });
        await createPost({
          type: "video",
          title: input.title,
          caption: input.caption,
          category: input.category,
          youtubeUrl: input.youtubeUrl,
          youtubeId,
          location: input.location,
        });
        return { success: true };
      }),

    createVideoFilePost: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        caption: z.string().optional(),
        category: z.enum(["wildlife", "landscape", "street", "other"]),
        location: z.string().optional(),
        videoData: z.string(),
        videoMime: z.string().default("video/mp4"),
        videoFileName: z.string().default("video.mp4"),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.videoData, "base64");
        const key = `wilds-aura/videos/${Date.now()}-${input.videoFileName}`;
        const { url } = await storagePut(key, buffer, input.videoMime);
        await createPost({
          type: "video",
          title: input.title,
          caption: input.caption,
          category: input.category,
          videoUrl: url,
          videoKey: key,
          location: input.location,
        });
        return { success: true, url };
      }),

    updatePost: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        caption: z.string().optional(),
        category: z.enum(["wildlife", "landscape", "street", "other"]).optional(),
        location: z.string().optional(),
        youtubeUrl: z.string().url().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, youtubeUrl, ...rest } = input;
        const updateData: any = { ...rest };
        if (youtubeUrl) {
          const youtubeId = extractYoutubeId(youtubeUrl);
          if (!youtubeId) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid YouTube URL" });
          updateData.youtubeUrl = youtubeUrl;
          updateData.youtubeId = youtubeId;
        }
        await updatePost(id, updateData);
        return { success: true };
      }),

    deletePost: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.id);
        return { success: true };
      }),

    deleteComment: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteComment(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
