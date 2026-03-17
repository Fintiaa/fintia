export default function GoalProgress({progress}){

  return(

    <div className="progressBar">

      <div
        className="progress"
        style={{width:`${progress}%`}}
      />

    </div>

  )
}