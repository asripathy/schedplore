import React, { Component } from 'react';
import Hour from './Hour.js';

class Day extends Component {

    renderHour = (hour) => 
        (<Hour places={JSON.stringify(hour)} />);

    renderPlaces = (hours) => 
        hours.map((hour) => (
            <table>
                {this.renderHour(hour)}
            </table>
        ));

    render() {
        return(
            <div className="day_view">
                <style>{`
                    table {
                    font-family:arial, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                    }

                    td, th {
                    border:1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                    }
                `}</style>
                {this.renderPlaces(JSON.parse(this.props.places))}
            </div>
        )
    };

}

export default Day;
