import React, { useState, useEffect } from 'react'

import { FiCheckCircle } from 'react-icons/fi'

import './styles.css'

interface Props {
  show: boolean
}

const SuccessMessage: React.FC<Props> = ({ show }) => {

  const [showHideClassName, setShowHideClassName] = useState('modal display-none')

  useEffect(() => {
    const classNamesModal = show ? 'modal display-block' : 'modal display-none'

    setShowHideClassName(classNamesModal)

    if (show) {
      showModal()
    } else {
      hideModal()
    }
  }, [show])

  const showModal = () => {
    setShowHideClassName('modal display-block')
  }

  const hideModal = () => {
    setShowHideClassName('modal display-none')
  }

  return (
    <div className={showHideClassName}>
      <section className='modal-main'>
        <FiCheckCircle className='icon-message' />
        <p className='text-message'>Cadastro concluido!</p>
      </section>
    </div>
  )
}

export default SuccessMessage
