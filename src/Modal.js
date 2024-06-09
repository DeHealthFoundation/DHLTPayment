import React, { useState } from "react";
import Modal from "react-modal";

const CustomModal = ({ isOpen, closeModal, message }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal}>
      <div>{message}</div>
      <button onClick={closeModal}>Close</button>
    </Modal>
  );
};

export default CustomModal;
