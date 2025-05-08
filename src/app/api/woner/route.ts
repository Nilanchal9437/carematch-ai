import { NextRequest, NextResponse } from "next/server";
import Woner from "@/models/Woner";
import NursingHome from "@/models/NursingHome";
import mongoose from "mongoose";
import connectToDB from "@/db";
import { parse } from "csv-parse/sync";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDB();

    // Get search keyword and state from query params
    const { searchParams } = new URL(req.url);
    const searchKeyword = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage for search and state filters
    const matchStage: any = {};
    if (searchKeyword) {
      matchStage.owner_name = { $regex: searchKeyword, $options: "i" };
    }
    if (state) {
      matchStage.state = state;
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Project stage to select only required fields
    pipeline.push({
      $project: {
        _id: 1,
        owner_name: 1, 
        cms_certification_number_ccn: 1
      }
    });

    // Execute aggregation
    const woners = await Woner.aggregate(pipeline);

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

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString();

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Transform data to match woner schema
    const transformedData: any[] = [];

    records.map((record: any) =>
      transformedData.push({
        owner_name: record["Owner Name"] || "",
        cms_certification_number_ccn:
          record["CMS Certification Number (CCN)"] || "",
        provider_name: record["Provider Name"] || "",
        provider_address: record["Provider Address"] || "",
        citytown: record["City/Town"] || "",
        state: record["State"] || "",
        zip_code: record["ZIP Code"] || "",
        role_played_by_owner_or_manager_in_facility:
          record["Role played by Owner or Manager in Facility"] || "",
        owner_type: record["Owner Type"] || "",
        ownership_percentage: record["Ownership Percentage"] || "",
        association_date: record["Association Date"] || "",
        location: record["Location"] || "",
        processing_date: record["Processing Date"] || "",
      })
    );

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

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    
    const body = await req.json();
    const ownerId = body.id;

    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
    }

    try {
      const objectId = new mongoose.Types.ObjectId(ownerId);
    } catch (err) {
      return NextResponse.json({ error: "Invalid Owner ID format" }, { status: 400 });
    }

    // Get owner details
    const owner = await Woner.findById(ownerId).lean();

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Get all facilities for this owner using aggregation with lookup
    const facilities = await NursingHome.aggregate([
      {
        $match: {
          woner_ids: new mongoose.Types.ObjectId(ownerId)
        }
      },
      {
        $lookup: {
          from: "woners",
          localField: "woner_ids",
          foreignField: "_id",
          as: "owners"
        }
      },
      {
        $project: {
          _id: 1,
          provider_name: 1,
          state: 1,
          number_of_certified_beds: 1,
          average_number_of_residents_per_day: 1,
          overall_rating: 1,
          health_inspection_rating: 1,
          citytown: 1,
          zip_code: 1,
          owners: 1
        }
      }
    ]);

    console.log('Owner found:', owner);
    console.log('Facilities found:', facilities);

    return NextResponse.json({
      owner,
      facilities,
    });
  } catch (error: any) {
    console.error("Error in PUT route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}