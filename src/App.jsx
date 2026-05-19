import { useState, useRef } from 'react'
//import { parse } from "paraparse"
//import { xlsx } from "xlsx"
import nstLogo from './assets/nst.svg'
import './App.css'

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const acceptedFileExtensions = ["csv", "xlsx"];

  const acceptedFileTypesString = acceptedFileExtensions
    .map((ext) => `.${ext}`)
    .join(",");
  
  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      setError("File is required");
    } else if (!error) {
      setSelectedFiles([]);
      setError("");
    }
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
                        src={nstLogo}
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default App
