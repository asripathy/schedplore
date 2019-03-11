import React, { Component } from 'react';

class PlaceList extends Component {
    renderPlaces = (places) => 
        places.map((place) => (
            <tr style={{display: this.props.selectedType == place.type ? 'block' : 'none'}} className="row place-list-row">
                <td className="card-cell" onClick={()=>this.props.updateCalendar(place)}>
                <div className="card card-class place-card text-center">
                    {place.photo && <img className="card-img-top" src={place.photo} alt="Card image cap"/>}
                    <div className="card-body">
                        <h5 className="card-title">{place.name}</h5>
                        <p className="card-text">{place.address}</p>
                        <p className="card-text">{place.rating} <span>&#9733;</span></p> 
                    </div>
                </div>
                </td>
            </tr>
        ));

    render() {
        return(  
            <table className="place-list-table">
                <tbody>
                    {this.props.places &&
                        this.renderPlaces(JSON.parse(this.props.places))}
                </tbody>
            </table>    
        )
    };

}

export default PlaceList;