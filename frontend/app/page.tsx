import TopBar from "@/components/TopBar";
import PathTree from "@/components/PathTree";

export default function HomePage() {
  return (
    <main>
      <TopBar active="learn" />
      <div className="pt-10 px-4">
        <PathTree />
      </div>
    </main>
  );
}
