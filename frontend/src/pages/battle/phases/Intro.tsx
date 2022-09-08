import {User} from "@auth0/auth0-spa-js";

interface IntroProps {
  user: User
  onJoin: () => void
}

const Intro = ({ user, onJoin }: IntroProps) => {
  return (
    <div class={"text-white"}>
      Welcome
      <br/>
      {user.name}
      <br/>
      <button class={"bg-blue-100 p-5 text-black"} onClick={onJoin}>join</button>
    </div>
  )
}

export default Intro;
