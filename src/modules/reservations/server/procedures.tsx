import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prismadb";
import { reservationServerSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const reservationsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(reservationServerSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.betterAuthUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      try {
        const { startDate, endDate, totalPrice, listingId } = input;

        // Check if listing exists and is not deleted
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
        });

        if (!listing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }

        // Optional: Check that user is not booking their own listing
        // if (listing.userId === ctx.betterAuthUserId) {
        //   throw new TRPCError({
        //     code: "FORBIDDEN",
        //     message: "You cannot reserve your own listing.",
        //   });
        // }

        const reservation = await prisma.reservation.create({
          data: {
            startDate,
            endDate,
            totalPrice,
            userId: ctx.betterAuthUserId,
            listingId,
          },
        });

        return {
          success: true,
          message: "Reservation created successfully",
        };
        
      } catch (error) {
        // Re-throw tRPC errors as-is
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Error reservation [create]:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reservation",
        });
      }
    }),
    
  getUserReservations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.betterAuthUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    try {
      const reservations = await prisma.reservation.findMany({
        where: {
          userId: ctx.betterAuthUserId,
        },
        include: {
          listing: true,
          user: true,
        },
        orderBy: {
          startDate: "desc",
        },
      });

    return { reservations }
    } catch (error) {
      console.error("Error reservations [getUserReservations]:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get reservations",
        cause: error,
      });
    }
  }),

  delete: protectedProcedure
    .input(
      z.object({
        reservationId: z.string().uuid("Invalid reservation ID format"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.betterAuthUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        const { reservationId } = input;

        // Check if reservation exists and user owns it
        const reservation = await prisma.reservation.findUnique({
          where: { id: reservationId },
          select: {
            id: true,
            userId: true,
            startDate: true,
          },
        });

        if (!reservation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reservation not found",
          });
        }

        if (reservation.userId !== ctx.betterAuthUserId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You cannot delete a reservation you do not own",
          });
        }

        // // Optional: Check if reservation is in the future (business logic)
        // const now = new Date();
        // if (reservation.startDate <= now) {
        //   throw new TRPCError({
        //     code: "CONFLICT",
        //     message: "Cannot delete past or ongoing reservations",
        //   });
        // }

        const deletedReservation = await prisma.reservation.delete({
          where: { id: reservationId },
        });

        return {
          success: true,
          message: "Reservation deleted successfully",
        };
        
      } catch (error) {
        // Re-throw tRPC errors as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error reservations [delete]:", error);

         // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Reservation not found or already deleted",
              cause: error,
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete reservation",
          cause: error,
        });
      }
    }),
});
