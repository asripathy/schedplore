import React, { Component } from 'react';
import Script from 'react-load-script';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import logo from './logo.svg';
import './App.css';
import Hour from './Hour.js';
import List from './List.js';
// TODO: move to calendar.js
import BigCalendar from 'react-big-calendar';
import moment from 'moment';


BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

const MyCalendar = props => (
  <div>
    <BigCalendar
      events={[]}
      startAccessor='2/20/2015'
      endAccessor='2/28/2015'
    />
  </div>
);


class App extends Component {
  state = {
    response: '',
    address: ''
  };

  componentDidMount() {
    // this.callApi()
    //   .then(res => this.setState({ response: JSON.stringify(res) }))
    //   .catch(err => console.log(err));
  }

  callApi = async () => {
    let city = this.state.address
    if(city){
      const response = await fetch('/place/' + city);
      const body = await response.json();
      console.log(body);

      if (response.status !== 200) throw Error(body.message);
      this.setState({response: JSON.stringify(body)})
    }
  };

  handleChange = (address) => {
    this.setState({ address })
  }

  handleSelect = (address) => {
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error))
  }

  placeArr = ["Le Boulanger", "Quiznos", "Taco Bell"];

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <PlacesAutocomplete
          value={this.state.address}
          onChange={this.handleChange}
          onSelect={this.handleSelect}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: 'Search Places ...',
                  className: 'location-search-input',
                  id: 'city'
                })}
              />
              <div className="autocomplete-dropdown-container">
                {suggestions.map(suggestion => {
                  const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                  return (
                    <div {...getSuggestionItemProps(suggestion, { className, style })}>
                      <span>{suggestion.description}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>

        <BigCalendar
          selectable
          events={[]}
          localizer={BigCalendar.momentLocalizer}
          defaultView={BigCalendar.Views.WEEK}
          scrollToTime={new Date(2015, 1, 1, 6)}
          defaultDate={new Date(2015, 3, 12)}
          onSelectEvent={event => alert(event.title)}
          onSelectSlot={slotInfo =>
            alert(
              `selected slot: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                `\nend: ${slotInfo.end.toLocaleString()}` +
                `\naction: ${slotInfo.action}`
            )
          }
        />

        <button type="submit" onClick={this.callApi}>Search</button>
        <p> {this.state.response} </p>
      </div>
    );
  } 
}


export default App;
