import './App.css';
import React from 'react';

<head>
<style>
img.result {
  height: auto;
  width: 80%;
}
</style>
</head>


// atob is deprecated but this function converts base64string to text string
const decodeFileBase64 = (base64String) => {
  return "data:image/png;base64," + base64String
  // From Bytestream to Percent-encoding to Original string
  //return decodeURIComponent(
  //  atob(base64String).split("").map(function (c) {
  //   return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  //  }).join("")
  //);
};


function App() {
  const [inputFileData, setInputFileData] = React.useState(''); // represented as bytes data (string)
  const [outputFileData, setOutputFileData] = React.useState(''); // represented as readable data (text string)
  const [buttonDisable, setButtonDisable] = React.useState(true);
  const [buttonText, setButtonText] = React.useState('Submit');

  // convert file to bytes data
  const convertFileToBytes = (inputFile) => {
    console.log('converting file to bytes...');
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(inputFile); // reads file as bytes data

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  // handle file input
  const handleChange = async (event) => {
    // Clear output text.
    setOutputFileData("");

    console.log('newly uploaded file');
    const inputFile = event.target.files[0];
    console.log(inputFile);

    // convert file to bytes data
    const base64Data = await convertFileToBytes(inputFile);
    const base64DataArray = base64Data.split('base64,'); // need to get rid of 'data:image/png;base64,' at the beginning of encoded string
    const encodedString = base64DataArray[1];
    setInputFileData(encodedString);
    console.log('file converted successfully');

    // enable submit button
    setButtonDisable(false);
  }

  // handle file submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // temporarily disable submit button
    setButtonDisable(true);
    setButtonText('Loading Result');

    // make POST request
    console.log('making POST request...');
    fetch('https://zbgay4ai06.execute-api.us-east-1.amazonaws.com/220307_Version_0/', {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Accept": "text/plain" },
      body: JSON.stringify({ "image": inputFileData })
    }).then(response => response.json())
    .then(data => {
      console.log('getting response...')
      console.log(data);

      // POST request error
      if (data.statusCode === 400) {
        const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
        setOutputFileData(outputErrorMessage);
      }

      // POST request success
      else {
        const outputBytesData = JSON.parse(data.body)['outputResultsData'];
        setOutputFileData(decodeFileBase64(outputBytesData));
      }

      // re-enable submit button
      setButtonDisable(false);
      setButtonText('Submit');
    })
    .then(() => {
      console.log('POST request success');
    })
  }

  return (
    <div className="App">
      <div className="Input">
        <h1>Age and Gender estimation by Marcus Koenig</h1>
        <p>This is an interactive App to estimate the age and gender of one or more persons based on their faces. </p>
        <h2>Instructions</h2>
        <ol>
          <li>Press the Browse button</li>
          <li>Select an image</li>
          <li>Press the Submit button</li>
          <li>Wait until the result is loaded and displayed. This can take a few seconds.</li>
          <li>After the result has been displayed, you can start from the first step again.</li>
        </ol> 
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".png, .jpg, .jpeg" onChange={handleChange} />
          <button type="submit" disabled={buttonDisable}>{buttonText}</button>
        </form>
      </div>
      <div className="Output">
        <h2>Results</h2>
        <img class="result" src={outputFileData} alt="" /> 
      </div>
    </div>
  );
}

export default App;
