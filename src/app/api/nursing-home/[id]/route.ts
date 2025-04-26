import { NextRequest, NextResponse } from "next/server";
import NursingHome from "@/models/NursingHome";
import connectToDB from "@/db";

interface WonerDocument {
  _id: string;
  owner_name: string;
  cms_certification_number_ccn: string;
  owner_type: string;
  owner_ein: string;
  owner_npi: string;
  association_date: string;
}

interface NursingHomeDocument {
  _id: string;
  woner_ids: WonerDocument[];
  buy: number;
  sell: number;
  refinance: number;
  [key: string]: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;
    
    const nursingHome = await NursingHome.findById(id)
      .populate({
        path: "woner_ids",
        model: "Woner",
        select: "-__v",
      })
      .lean();

    if (!nursingHome) {
      return NextResponse.json(
        { message: "Nursing home not found" },
        { status: 404 }
      );
    }

    const transformedNursingHome = {
      ...nursingHome,
      woner_ids: (nursingHome as unknown as NursingHomeDocument).woner_ids.map(
        (owner) => ({
          ...owner,
          association_date: owner.association_date
            ? new Date(owner.association_date).toLocaleDateString()
            : "N/A",
        })
      ),
    };

    return NextResponse.json(
      {
        data: transformedNursingHome,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching nursing home details:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching nursing home details" },
      { status: 500 }
    );
  }
}
