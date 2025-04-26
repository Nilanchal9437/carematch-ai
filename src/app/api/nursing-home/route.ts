import { NextRequest, NextResponse } from "next/server";
import NursingHome from "@/models/NursingHome";
import connectToDB from "@/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("GET API called - Connecting to DB...");
    await connectToDB();
    console.log("DB connection established");

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

    // Determine sort order based on sortBy parameter
    let sortOptions: any = { number_of_certified_beds: -1 }; // default sort
    if (sortBy) {
      switch (sortBy) {
        case "buy":
          sortOptions = { buy: -1 };
          break;
        case "sell":
          sortOptions = { sell: -1 };
          break;
        case "refinance":
          sortOptions = { refinance: -1 };
          break;
        case "rating":
          sortOptions = { overall_rating: -1 };
          break;
      }
    }
    console.log("Sort options:", sortOptions);

    console.log("Fetching nursing homes...");
    // Fetch nursing homes with filters and pagination
    const nursingHomes = await NursingHome.find(query)
      .populate({
        path: "woner_ids",
        select: "_id owner_name",
        model: "Woner",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`Found ${nursingHomes.length} nursing homes`);

    // Get total count for pagination
    console.log("Calculating pagination...");
    const totalCount = await NursingHome.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    console.log("Calculating statistics...");
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
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
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
