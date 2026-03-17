export default function PercentageChange({value}){

    const color = value > 0 ? "red" : "green"

    return(
        <div>
            <h3>Variación</h3>
            <span style={{color}}>
                {value.toFixed(2)}%
            </span>
        </div>
    )
}