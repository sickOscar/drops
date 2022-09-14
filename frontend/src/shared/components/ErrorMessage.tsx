import error from "../../assets/error.png";

interface Props {
  message: string
}

const ErrorMessage = (props: Props) => {
  return (
    <>
      <img src={error} alt="error" class={"w-full object-cover my-10"}/>

      <span class={"text-white text-xl"}>
        {
          props.message
        }
      </span>
    </>
  )
}

export default ErrorMessage;
