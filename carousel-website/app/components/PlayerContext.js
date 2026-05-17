"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

export const TRACKS = [
  { id: 1, title: "Golden Hours",        album: "Golden Hours", year: "2026", duration: "4:12", src: "" },
  { id: 2, title: "The Weight of Silver", album: "Golden Hours", year: "2026", duration: "3:55", src: "" },
  { id: 3, title: "Last Train South",    album: "Golden Hours", year: "2026", duration: "5:02", src: "" },
  { id: 4, title: "Dust & Wire",         album: "Dust & Wire",  year: "2023", duration: "3:47", src: "" },
  { id: 5, title: "Kindling",            album: "Dust & Wire",  year: "2023", duration: "4:18", src: "" },
  { id: 6, title: "Reckless Weather",    album: "Dust & Wire",  year: "2023", duration: "3:29", src: "" },
  { id: 7, title: "First Light",         album: "First Light",  year: "2021", duration: "3:22", src: "" },
  { id: 8, title: "Still Water",         album: "First Light",  year: "2021", duration: "4:44", src: "" },
];

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      const idx = TRACKS.findIndex((t) => t.id === currentTrack?.id);
      const next = TRACKS[(idx + 1) % TRACKS.length];
      setCurrentTrack(next);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.src;
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  const play = useCallback((track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((v) => !v);
  }, [currentTrack]);

  const skip = useCallback(
    (dir) => {
      if (!currentTrack) return;
      const idx = TRACKS.findIndex((t) => t.id === currentTrack.id);
      const next = TRACKS[(idx + dir + TRACKS.length) % TRACKS.length];
      setCurrentTrack(next);
      setIsPlaying(true);
      setProgress(0);
    },
    [currentTrack]
  );

  const seek = useCallback((ratio) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, isPlaying, progress, audioRef, play, togglePlay, skip, seek }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
