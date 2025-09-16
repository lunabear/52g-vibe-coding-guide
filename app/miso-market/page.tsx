"use client";

import { SimpleHeader } from "@/components/layout/SimpleHeader";
import Footer from "@/components/layout/Footer";
import MISOMarket from "@/components/home/MISOMarket";
import type { ReactElement } from "react";

export default function MISOMarketPage(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleHeader />
      <MISOMarket />
      <Footer />
    </div>
  );
}


