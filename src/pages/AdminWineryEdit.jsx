import React from "react";
import { useParams } from "react-router-dom";
import WineryForm from "../components/admin/WineryForm";

export default function AdminWineryEdit() {
  const { id } = useParams();
  return <WineryForm wineryId={id} />;
}