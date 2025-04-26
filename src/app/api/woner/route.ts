import { NextRequest, NextResponse } from "next/server";
import Woner from "@/models/Woner";
import connectToDB from "@/db";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDB();

    // Get the page number, search keyword and state from query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const searchKeyword = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";
    const limit = 100;
    const skip = (page - 1) * limit;

    // Create search query with optional state filter
    let searchQuery: any = {};

    if (searchKeyword) {
      searchQuery.owner_name = { $regex: searchKeyword, $options: "i" };
    }

    if (state) {
      searchQuery.state = state;
    }

    // Fetch woners with pagination, search filter, and selected fields
    const woners = await Woner.find(searchQuery, {
      owner_name: 1,
      cms_certification_number_ccn: 1,
      _id: 1,
    })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info with search filter
    const totalCount = await Woner.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        data: woners,
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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching woner data:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching woner data" },
      { status: 500 }
    );
  }
}
