import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';

import SuccessMessage from './../../components/SuccessMessage'
import Dropzone from './../../components/Dropzone'

import './style.css';
import logo from '../../assets/logo.svg';

//quando cria um estado para um objeto, é necessario informar manualmente o tipo da variavel ao recuperar

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface IbgeUfResponse {
  sigla: string;
}
interface IbgeCityResponse {
  nome: string;
}

const CreatePoint = () =>{
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [citys, setCitys] = useState<string[]>([]);

  const [initialPosition, setInicialPosition] = useState<[number, number]>([0,0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    image: ''
  });

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [successMessageVisible, setSuccessMessageVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory();

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);

    });
  }, []);

  useEffect(() => {
    axios.get<IbgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if(selectedUf === '0' ){
      return;
    }

    axios.get<IbgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityName = response.data.map(city => city.nome);
      setCitys(cityName);
    });
  }, [selectedUf]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;

      setInicialPosition([latitude, longitude]);

      //console.log(latitude, longitude);
    });
  },[])

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    //console.log(event.target.name)
    const {name, value} = event.target;

    setFormData({...formData, [name]: value});
  }

  function handleSelectItem(id: number){
    //setSelectedItems([id])
    const alreadySelectaed = selectedItems.findIndex(item => item === id);
    if(alreadySelectaed >= 0){
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    }else{
      setSelectedItems([...selectedItems, id]);
    }
    
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    //const image = selectedFile;

    const data = {
      name, email, whatsapp, latitude, longitude, city, uf, items
    };
    
    
    await api.post('points', data);
  

    setSuccessMessageVisible(true)
    setTimeout(function () {
      setSuccessMessageVisible(false)
      history.push('/')
    }, 2000)
  }

  return(
    <div id="page-create-point">
      <SuccessMessage show={successMessageVisible} />
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Home
        </Link>
      </header>


      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta.</h1>

        <Dropzone onFileUploaded={setSelectedFile} />
{/* dados do onto */}
        <fieldset>
          <legend><h2>Dados</h2></legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
                <input 
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
            </div>

            <div className="field">
            <label htmlFor="whatsapp">WahtsApp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
{/* endereço */}
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={12} onclick={handleMapClick}>
            <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" 
                value={selectedUf} onChange={handleSelectedUf}
              >                
                <option value="0">Selecione o estado</option>
                {ufs.map(uf => (
                  <option value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectedCity}
              >
                <option value="0">Selecione a cidades</option>
                {citys.map(city => (
                  <option value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

        </fieldset>

        {/* pontos de coleta */}
        <fieldset>
          <legend>
            <h2>Ítems de coleta</h2>
            <span>Selecione um item abaixo</span>
          </legend>
            <ul className="items-grid">
              {items.map(item => (
                <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={(selectedItems.includes(item.id)) ? 'selected' : ''}
                >  
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
        </fieldset>

        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
      
    </div>
  )
}

export default CreatePoint;