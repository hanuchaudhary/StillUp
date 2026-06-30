import { useCallback, useEffect, useRef, useState } from "react";

import { IconCircleCheckFilled } from "@tabler/icons-react";

import createGlobe, { type Arc } from "cobe";

import { useTheme } from "@/components/theme-provider";

const regions = [
  {
    name: "US East (Virginia)",
    coords: [37.4316, -78.6569] as [number, number],
  },
  { name: "EU West (Ireland)", coords: [53.1424, -7.6921] as [number, number] },
  {
    name: "Asia Pacific (Singapore)",
    coords: [1.3521, 103.8198] as [number, number],
  },
];

interface InteractiveMarker {
  id: string;
  location: [number, number];
  name: string;
  users: number;
}

interface GlobeInteractiveProps {
  markers?: InteractiveMarker[];
  className?: string;
  speed?: number;
}

const defaultMarkers: InteractiveMarker[] = [
  {
    id: "us-east",
    location: [37.4316, -78.6569],
    name: "US East (Virginia)",
    users: 1420,
  },
  {
    id: "eu-west",
    location: [53.1424, -7.6921],
    name: "EU West (Ireland)",
    users: 980,
  },
  {
    id: "asia-pacific",
    location: [1.3521, 103.8198],
    name: "Asia Pacific (Singapore)",
    users: 760,
  },
];

const arcs: Arc[] = [
  {
    from: [37.4316, -78.6569],
    to: [53.1424, -7.6921],
  },
  {
    from: [53.1424, -7.6921],
    to: [1.3521, 103.8198],
  },
  {
    from: [1.3521, 103.8198],
    to: [37.4316, -78.6569],
  },
];

export function GlobeInteractive({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeInteractiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0) return;
      if (globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: theme === "dark" ? 1.05 : 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 12,
        mapBaseBrightness: 0,
        baseColor: [1, 1, 1],
        markerColor: [0.3, 0.8, 0.6],
        glowColor: theme === "dark" ? [0, 0, 0] : [1, 1, 1],
        scale: 1.2,
        markerElevation: 0,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.025,
          id: m.id,
          color: [0.3, 0.8, 0.6],
        })),
        arcs: arcs.map((a) => ({
          from: a.from,
          to: a.to,
          color: [0.3, 0.8, 0.6],
        })),
        arcColor: [0.3, 0.8, 0.6],
        arcWidth: 1,
        arcHeight: 0.25,
      });

      function animate() {
        if (!isPausedRef.current) phi += speed;
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed, theme]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 0.8; transform: translateY(0); }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          onClick={() => setExpanded(expanded === m.id ? null : m.id)}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 6,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            padding: expanded === m.id ? "0.4rem 0.6rem" : "0.3rem 0.5rem",
            background: "#51f0a8",
            color: "#000",
            borderRadius: 3,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition:
              "opacity 0.4s, filter 0.4s, transform 0.2s, padding 0.2s",
            zoom: expanded === m.id ? 1.05 : 1,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            {m.name}
          </span>
          {expanded === m.id && (
            <span
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.55rem",
                opacity: 0.8,
                marginTop: "0.15rem",
                animation: "fade-slide-in 0.2s ease-out",
              }}
            >
              {m.users.toLocaleString()} users
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function RegionsSection() {
  return (
    <section className="py-24 px-6 border-y font-geist">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="md:pl-10">
            <h2 className="lg:text-4xl text-3xl tracking-wide font-heading mb-6">
              Monitor from
              <br />
              <span className="text-primary">anywhere in the world</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light mb-8">
              Our distributed infrastructure checks your services from multiple
              geographic locations simultaneously. If your site is down in Asia
              but up in Europe, we'll know.
            </p>
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.name} className="flex items-center gap-3">
                  <IconCircleCheckFilled className="size-5 text-primary" />
                  <span className="font-medium">{region.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md">
              <GlobeInteractive />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
