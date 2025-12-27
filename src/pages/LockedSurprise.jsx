import { useState } from "react";
import PasswordGate from "../components/PasswordGate";
import SurpriseScene from "../scenes/SurpriseScene";

export default function LockedSurprise() {
  const [open, setOpen] = useState(false);

  return (
    <div className="locked-surprise-wrapper">
      {open ? <SurpriseScene /> : <PasswordGate onSuccess={() => setOpen(true)} />}
    </div>
  );
}