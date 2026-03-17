export default function ReminderList({reminders}){

    return(
        <div className="reminders">

        {reminders.map((r,i)=>(
            <div key={i} className="reminderCard">
                <p>{r.title}</p>
                <span>{r.time}</span>
            </div>
        ))}

        </div>
    )
}