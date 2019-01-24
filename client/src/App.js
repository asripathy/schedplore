import React, { Component } from 'react';
import Script from 'react-load-script';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import logo from './logo.svg';
import './App.css';
import Hour from './Hour.js';
import List from './List.js';
import BigCalendar from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from 'moment'

const localizer = BigCalendar.momentLocalizer(moment)

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      response: '',
      address: '',
      events: []
    }
  }
  

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

  onSlotChange(slotInfo) {
    var startDate = moment(slotInfo.start.toLocaleString()).toDate();
    var endDate = moment(slotInfo.end.toLocaleString()).toDate();
    console.log(startDate); 
    console.log(endDate);
}

  searchOptions = {
    types: ['(cities)']
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
          searchOptions={this.searchOptions}
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
        <button type="submit" onClick={this.callApi}>Search</button>
        <p> {this.state.response} </p>

        <BigCalendar
          selectable
          onSelectSlot={(slotInfo) => this.onSlotChange(slotInfo) }
          localizer={localizer}
          events={[]}
          defaultDate={new Date()}
          defaultView="week"
          style={{ height: "100vh" }}

        />

      </div>
    );
  }
}


export default App;
