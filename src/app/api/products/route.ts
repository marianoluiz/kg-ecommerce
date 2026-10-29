import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Supabase query error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: data,
    });
  } catch (error) {
    console.error("Unexpected API error:", error);

    return NextResponse.json(
      { error: "Unable to connect to Supabase" },
      { status: 500 }
    );
  }
}
