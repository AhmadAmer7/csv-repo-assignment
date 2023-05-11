import React, { useEffect, useState } from 'react';
import { API, Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

async function getIdToken() {
  const currentUser = await Auth.currentAuthenticatedUser();
  return currentUser.signInUserSession.idToken.jwtToken;
}
const cors=require("cors");
function FileList() {
  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    if (showFiles) {
      fetchFiles();
    }
  }, [showFiles]);

  async function fetchFiles() {
    try {
      const response = await API.get('Ahmad-API', '/files');
      const body = JSON.parse(response.body);
      const fileList = Array.isArray(body) ? body : body.files;
      console.log('Files retrieved:', fileList);
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }

  async function downloadFile(fileName) {
    try {
      const response = await API.get('Ahmad-API', `/files/${fileName}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  async function deleteFile(fileName) {
    try {
      const idToken = await getIdToken();
      const myInit = {
        headers: {
          Authorization: idToken,
        },
      };
      await API.del('Ahmad-API', `/files/${fileName}`, myInit);
      setFiles((prevFiles) => prevFiles.filter((file) => file !== fileName));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  return (
    <div>
      <h2>Files List</h2>
      <button onClick={() => setShowFiles(!showFiles)}>
        {showFiles ? 'Hide Files' : 'Show Files'}
      </button>
      {showFiles && files && (
  <ul>
    {files.map((file) => (
      <li key={file.name}>
        {file.name}
        <button onClick={() => downloadFile(file.name)}>Download</button>
        <button onClick={() => deleteFile(file.name)}>Delete</button>
      </li>
    ))}
  </ul>
)}
    </div>
  );
}

function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);

  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const fileContent = await readFileAsDataURL(file);
      setSelectedFile({
        name: file.name,
        content: fileContent
      });
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }
  
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async function uploadFile() {
    if (!selectedFile) return;
  
    const requestBody = {
      fileName: selectedFile.name,
      csv: selectedFile.content,
    };
  
    try {
      await API.post('Ahmad-API', '/files', {
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      setSelectedFile(null);
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload File</button>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <FileList />
      <FileUploader />
    </div>
  );
}

export default withAuthenticator(App);