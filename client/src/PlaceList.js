import React, { Component } from 'react';

class PlaceList extends Component {
    renderPlaces = (places) => 
        places.map((place) => (
            <tr style={{display: this.props.selectedType == place.type ? 'block' : 'none'}} class="row place-list-row">
                <td class="card-cell" onClick={()=>this.props.updateCalendar(place)}>
                <div class="card card-class place-card text-center">
                    {place.photo && <img class="card-img-top" src={place.photo} alt="Card image cap"/>}
                    <div class="card-body">
                        <h5 class="card-title">{place.name}</h5>
                        <p class="card-text">{place.address}</p>
                        <p class="card-text">{place.rating} <span>&#9733;</span></p> 
                    </div>
                </div>
                </td>
            </tr>
        ));

    render() {
        return(  
            <table className="place-list-table">
                {this.props.places &&
                    this.renderPlaces(JSON.parse(this.props.places))}
            </table>    
        )
    };

}

export default PlaceList;


