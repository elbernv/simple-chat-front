const registrar = async ()=>{
  const formdata = new FormData();

  const tuname = document.getElementById('tuname').value
  const tuimagen = document.getElementById('tuimagen').files

  if(!tuname || tuname.length > 10){
    alert('debes ingresar el nombre');
    return;
  }

  if(tuimagen.length === 0){
    alert('deber escojer la imagen')
    return;
  }

  formdata.append("file", tuimagen[0]);
  formdata.append("name", tuname);

  console.log(formdata);
  try {
    let response = await axios.post(`http://192.168.2.229:3001/create-profile`, formdata)  

    if(response.data.message === "ok bro"){
      window.location.href = `/?${encodeURIComponent(tuname)}`
    }
  } catch (error) {
    console.log(error);
    alert('Ocurrio un error, intentalo más tarde');
  }
  
}