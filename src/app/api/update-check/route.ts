import { NextRequest, NextResponse } from "next/server";
import { shouldUpdateData, updateLastUpdateTime } from "@/utils/updateChecker";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Check if update is needed
    const needsUpdate = await shouldUpdateData();

    if (!needsUpdate) {
      return NextResponse.json({
        message: "Data is up to date",
        updated: false
      }, { status: 200 });
    }

    // Perform the updates
    const [wonerResponse, nursingHomeResponse] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/woner/woner-update`),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/nursing-home/update`)
    ]);

    // Update the last update time
    await updateLastUpdateTime();

    return NextResponse.json({
      message: "Data updated successfully",
      updated: true,
      wonerStatus: wonerResponse.status,
      nursingHomeStatus: nursingHomeResponse.status
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error in update check API:", error);
    return NextResponse.json({
      message: "Error checking/performing updates",
      error: error.message
    }, { status: 500 });
  }
} 