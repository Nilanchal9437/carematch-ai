import { NextRequest, NextResponse } from "next/server";
import NursingHome from "@/models/NursingHome";
import Woner from "@/models/Woner";  // Import Woner model
import connectToDB from "@/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("GET API called - Connecting to DB...");
    await connectToDB();
    console.log("DB connection established");

    // Ensure Woner model is registered
    if (!mongoose.models.Woner) {
      console.log("Registering Woner model...");
      mongoose.model("Woner", Woner.schema);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const searchKeyword = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";
    const wonerId = searchParams.get("wonerId") || "";
    const minBeds = searchParams.get("minBeds") || "";
    const sortBy = searchParams.get("sortBy") || "";

    console.log("Query parameters:", {
      page,
      searchKeyword,
      state,
      wonerId,
      minBeds,
      sortBy,
    });

    const limit = 100;
    const skip = (page - 1) * limit;

    // Build query based on filters
    let query: any = {};
    console.log("Building query filters...");

    // Search filter for provider_name or citytown
    if (searchKeyword) {
      query.$or = [
        { provider_name: { $regex: searchKeyword, $options: "i" } },
        { citytown: { $regex: searchKeyword, $options: "i" } },
      ];
    }

    // State filter
    if (state) {
      query.state = state;
    }

    // Woner filter
    if (wonerId) {
      query.woner_ids = new mongoose.Types.ObjectId(wonerId);
    }

    // Number of certified beds filter
    if (minBeds) {
      query.number_of_certified_beds = {
        $eq: minBeds,
      };
    }

    console.log("Final query:", JSON.stringify(query, null, 2));

    console.log("Fetching nursing homes...");
    // First get all matching documents to sort properly
    let nursingHomes = await NursingHome.find(query)
      .populate({
        path: "woner_ids",
        model: mongoose.models.Woner,
        select: "_id owner_name"
      })
      .lean();

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "buy":
          nursingHomes.sort((a, b) => b.buy - a.buy);
          break;
        case "sell":
          nursingHomes.sort((a, b) => b.sell - a.sell);
          break;
        case "refinance":
          nursingHomes.sort((a, b) => b.refinance - a.refinance);
          break;
        case "rating":
          nursingHomes.sort((a, b) => {
            const ratingA = parseFloat(a.overall_rating) || 0;
            const ratingB = parseFloat(b.overall_rating) || 0;
            return ratingB - ratingA;
          });
          break;
        case "beds_high_to_low":
          nursingHomes.sort((a, b) => {
            const bedsA = parseInt(a.number_of_certified_beds) || 0;
            const bedsB = parseInt(b.number_of_certified_beds) || 0;
            return bedsB - bedsA;
          });
          break;
        case "beds_low_to_high":
          nursingHomes.sort((a, b) => {
            const bedsA = parseInt(a.number_of_certified_beds) || 0;
            const bedsB = parseInt(b.number_of_certified_beds) || 0;
            return bedsA - bedsB;
          });
          break;
      }
    }

    // Apply pagination after sorting
    const totalCount = nursingHomes.length;
    nursingHomes = nursingHomes.slice(skip, skip + limit);

    console.log(`Found ${totalCount} nursing homes, showing ${nursingHomes.length} on page ${page}`);

    // Calculate averages for investment ratings
    const aggregateResult = await NursingHome.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgBuy: { $avg: "$buy" },
          avgSell: { $avg: "$sell" },
          avgRefinance: { $avg: "$refinance" },
          totalHomes: { $sum: 1 },
        },
      },
    ]);

    console.log("Aggregate results:", aggregateResult);

    const stats = aggregateResult[0] || {
      avgBuy: 0,
      avgSell: 0,
      avgRefinance: 0,
      totalHomes: 0,
    };

    const response = {
      data: nursingHomes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      filters: {
        searchKeyword,
        state,
        wonerId,
        minBeds,
        sortBy,
      },
      stats: {
        averageBuyRating: Math.round(stats.avgBuy * 10) / 10,
        averageSellRating: Math.round(stats.avgSell * 10) / 10,
        averageRefinanceRating: Math.round(stats.avgRefinance * 10) / 10,
        totalHomes: stats.totalHomes,
      },
    };

    console.log("Sending successful response");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/nursing-home:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching nursing homes data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    // Get filters from request body
    const body = await req.json();
    const { state, wonerId } = body;

    // Build initial match stage for filtering
    const matchStage: any = {};

    if (state) {
      matchStage.state = state;
    }

    if (wonerId) {
      matchStage.woner_ids = wonerId
        ? mongoose.Types.ObjectId.createFromHexString(wonerId)
        : undefined;
    }

    // Use MongoDB aggregation to get unique bed counts
    const uniqueBedCounts = await NursingHome.aggregate([
      // Apply filters if any
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      // Get unique bed counts
      {
        $group: {
          _id: "$number_of_certified_beds",
          count: { $sum: 1 }, // Count how many homes have this bed count
        },
      },
      // Filter out null or empty values
      {
        $match: {
          _id: {
            $exists: true,
            $nin: [null, ""],
          },
        },
      },
      // Convert string to number for proper sorting
      {
        $addFields: {
          numericBedCount: { $toInt: "$_id" },
        },
      },
      // Sort by bed count in descending order
      {
        $sort: {
          numericBedCount: -1, // Sort in descending order
        },
      },
      // Project to rename fields and remove temporary field
      {
        $project: {
          bedCount: "$_id",
          numberOfHomes: "$count",
          _id: 0,
        },
      },
    ]);

    return NextResponse.json(
      {
        data: uniqueBedCounts,
        total: uniqueBedCounts.length,
        filters: {
          state,
          wonerId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching unique bed counts:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching unique bed counts" },
      { status: 500 }
    );
  }
}
