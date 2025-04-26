import { NextRequest, NextResponse } from "next/server";
import Woner from "@/models/Woner";
import connectToDB from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDB();

    // Get search keyword and state from query params
    const { searchParams } = new URL(req.url);
    const searchKeyword = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";

    // Create search query with optional state filter
    let searchQuery: any = {};

    if (searchKeyword) {
      searchQuery.owner_name = { $regex: searchKeyword, $options: "i" };
    }

    if (state) {
      searchQuery.state = state;
    }

    // Fetch all woners matching the search criteria
    const woners = await Woner.find(searchQuery, {
      owner_name: 1,
      cms_certification_number_ccn: 1,
      _id: 1,
    }).sort({ owner_name: 1 }); // Sort by owner name

    return NextResponse.json(
      {
        data: woners,
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
