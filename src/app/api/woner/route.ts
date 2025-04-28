import { NextRequest, NextResponse } from "next/server";
import Woner from "@/models/Woner";
import connectToDB from "@/db";
import { parse } from "csv-parse/sync";
import axios from "axios";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

// Increase the payload size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1000mb",
    },
  },
};

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload file to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Read file content from blob URL
    const response = await fetch(blob.url);
    const fileContent = await response.text();

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Transform data to match woner schema
    const transformedData = records.map((record: any) => ({
      owner_name: record["Owner Name"] || "",
      cms_certification_number_ccn: record["CMS Certification Number (CCN)"] || "",
      provider_name: record["Provider Name"] || "",
      provider_address: record["Provider Address"] || "",
      citytown: record["City/Town"] || "",
      state: record["State"] || "",
      zip_code: record["ZIP Code"] || "",
      role_played_by_owner_or_manager_in_facility: record["Role played by Owner or Manager in Facility"] || "",
      owner_type: record["Owner Type"] || "",
      ownership_percentage: record["Ownership Percentage"] || "",
      association_date: record["Association Date"] || "",
      location: record["Location"] || "",
      processing_date: record["Processing Date"] || "",
    }));

    // Connect to database
    await connectToDB();

    // Clear existing data if needed
    await Woner.deleteMany({});

    // Insert new data using Mongoose
    const result = await Woner.insertMany(transformedData);

    await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/nursing-home/update`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${result.length} records`,
      data: result,
    });
  } catch (error: any) {
    console.error("Error processing CSV:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
