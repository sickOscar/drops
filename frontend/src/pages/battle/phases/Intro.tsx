import {User} from "@auth0/auth0-spa-js";

interface IntroProps {
  user: User
  onJoin: () => void
}

const Intro = ({ user, onJoin }: IntroProps) => {
  return (
    <>
      Welcome
      <br/>
      {user.name}
      <br/>
      <button class={"bg-blue-100 p-5"} onClick={onJoin}>join</button>
    </>
  )
}

export default Intro;
