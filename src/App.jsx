import { useState, useRef } from 'react'
import Select from 'react-select'
import dropdownStyles from './components/dropdownStyles'
import { convertCyclades } from "./components/converters/cyclades";
import { convertHoliday } from "./components/converters/holiday";
import { convertRideways } from "./components/converters/rideways";
import { convertZenix } from "./components/converters/zenix";
import nstLogo from './assets/nst.svg'
import documentIcon from './assets/document.png'
import './App.css'

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  const fileInputRef = useRef(null);
  const acceptedFileExtensions = ["csv", "xlsx"];

  const partnerData = [
            { value: 'rideways', label: 'Rideways' },
            //{ value: 'ath_holiday', label: 'Holiday (Athens)' },
            { value: 'sant_holiday', label: 'Holiday (Santorini)' },
            //{ value: 'arr_tui', label: 'Tui (Arrivals)' },
            //{ value: 'dep_tui', label: 'Tui (Departures)' },
            { value: 'fay', label: 'Cyclades Collection' },
            //{ value: 'aurinko', label: 'Aurinko' },
            { value: 'zenix', label: 'EasyJet' },
          ];

  const acceptedFileTypesString = acceptedFileExtensions
    .map((ext) => `.${ext}`)
    .join(",");
  
  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      setError("File is required");
      return;
    }
    if (!selectedPartner) {
        setError("Partner selection is required");
        return;
    } 

    console.log("Selected Partner:", selectedPartner);
    console.log("Selected Files:", selectedFiles);

    switch (selectedPartner.value) {
      case 'rideways':
        convertRideways(selectedFiles);
        break;
      case 'sant_holiday':
        convertHoliday(selectedFiles);
        break;
      case 'fay':
        convertCyclades(selectedFiles);
        break;
      case 'zenix':
        convertZenix(selectedFiles);
        break;
      default:
        setError("Unknown partner selected");
    } 
    setSelectedFiles([]);
    setError("");
  };
  
  const handleFileChange = (event) => {
    const newFileArray = Array.from(event.target.files);
    processFiles(newFileArray);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (filesArray) => {
    const newSelectedFiles = [...selectedFiles];
    let hasError = false;
    const fileTypeRegex = new RegExp(acceptedFileExtensions.join("|"), "i")
    console.log(fileTypeRegex, "fileTypeRegex");
    filesArray.forEach((file) => {
      if (newSelectedFiles.some((f) => f.name === file.name)) {
        setError("File names must be unique");
        hasError = true;
      } else if (!fileTypeRegex.test(file.name.split(".").pop())) {
        setError(`Only ${acceptedFileExtensions.join(", ")} files are allowed`);
      } else {
        newSelectedFiles.push(file);
      }
    });

    if (!hasError) {
      setError("");
      setSelectedFiles(newSelectedFiles);
    }
  };

  const handleCustomButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileDelete = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  return (
    <div className='page-wrapper'>
      <div className='card'>
        <h2>
          NST Converter
        </h2>
        <div className='dropdown-wrapper'>
          <Select
            options={partnerData}
            onChange={setSelectedPartner}
            placeholder="Select a partner"
            isClearable
            styles={dropdownStyles}
            isSearchable={false}
          />
        </div>
        <div className='grid'>
          <div
            className='dropzone'
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e)}
          >
           <img
              src={nstLogo}
              alt="Upload File"
            /> 
            <p>Drag and Drop files</p>
            <p><strong>or</strong></p>
            <button 
              type='button'
              onClick={handleCustomButtonClick}
              className='btn-upload'
            >
              Upload
            </button>
            <input 
              type='file'
              id='files'
              name='files'
              multiple
              accept={acceptedFileTypesString}
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              onClick={(event) => {
                event.target.value = null;
              }}
              />
          </div>

          <div className='file-list'>
            {selectedFiles.length > 0 ? (
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={file.name}>
                    <div className='file-info'>
                      <img
                        src={documentIcon}
                        alt='File Icon'
                      />
                      <span>{file.name}</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleFileDelete(index)}
                      className='btn-delete'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='none'
                            style={{ width: '1.5rem', height: '1.5rem' }}
                          >
                            <path
                              stroke='currentColor'
                              strokeWidth='2'
                              d='M6 4l8 8M14 4l-8 8'
                            />
                          </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='empty-state'>
                <p>No Files Uploaded Yet</p>
              </div>
            )}
          </div>
        </div>
        {error && <p className='error-text'>{error}</p>}
        <div className='save-wrapper'>
          <button
            type='button'
            onClick={handleSubmit}
            className='btn-save'
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}

export default App
