import PetAppComponent from "../components/pet-app"; // エクスポートの修正

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full h-[80vh] max-w-5xl">
        <PetAppComponent />
      </div>
    </main>
  );
}
