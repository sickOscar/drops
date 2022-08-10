import { Link } from "solid-app-router"

const Home = () => {
  const buttonStyles = "bg-blue-300 p-5 mx-2";

  return (
    <div class="h-full w-full flex justify-center items-center">
      <div>
        <h1 class="text-5xl">Drops</h1>
        <div>There it is, the new challenge...</div>
        <div class="flex">
          <Link href="/battle" class={buttonStyles}>
            Play now
          </Link>
          <Link href="/viewer" class={buttonStyles}>
            View
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home;
