import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader as DreiLoader } from "@react-three/drei";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import LockedSurprise from "./pages/LockedSurprise";
import Final from "./pages/Final";
import Admin from "./pages/Admin";
import SweatyHome from "./pages/SweatyHome";
import MusicPlayer from "./components/MusicPlayer";
import Navigation from "./components/Navigation";

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/surprise" element={<LockedSurprise />} />
      <Route path="/final" element={<Final />} />
      <Route path="/sweaty-home" element={<SweatyHome />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MusicPlayer />
      <Navigation />
      <Suspense fallback={null}>
        <AppContent />
      </Suspense>
      {/* 
        DreiLoader automatically detects R3F loading state.
        We customize its styles to match our theme.
      */}
      <DreiLoader 
        containerStyles={{ background: 'radial-gradient(circle, #FCE4EC 0%, #F8BBD0 100%)' }}
        innerStyles={{ width: '300px', height: '10px', background: '#FFF' }}
        barStyles={{ background: '#FF69B4', height: '10px' }}
        dataStyles={{ color: '#880E4F', fontSize: '1.2rem', fontFamily: 'Poppins', fontWeight: 'bold' }}
        dataInterpolation={(p) => `Loading Magic... ${p.toFixed(0)}%`}
      />
    </BrowserRouter>
  );
}