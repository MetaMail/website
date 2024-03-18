/*
 * @Author: your name
 * @Date: 2024-02-24 17:10:01
 * @LastEditTime: 2024-03-04 20:37:25
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\Common\Modal.tsx
 */
import React, { useState, ReactNode } from 'react';

interface ModalProps {
  title: string;
  content?: string;
  isOpen: boolean;
  children: ReactNode,
  onClose: () => void;
  onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, content, isOpen, onClose, onConfirm, children }) => {
  return (
    <>
      {isOpen && (
        <dialog id="my_modal_1" className="modal modal-open">
          <div className="modal-box box-border">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="py-4 box-border break-all text-left">{children}</p>
            <div className="modal-action">
              <form method="dialog" className="flex justify-end gap-8">
                <button
                  className="bg-transparent   h-34 flex justify-center items-center text-[#666] border-neutral-400 border-[1px] dark:text-white px-14 py-8  rounded-[6px] text-[14px]"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="modal-close h-34 flex justify-center items-center bg-primary text-white px-14 py-8  rounded-[6px] text-[14px]"
                  onClick={onConfirm}
                >
                  Confirm
                </button>
              </form>
            </div>
          </div>
        </dialog>

      )}
    </>
  );
};

export default Modal;
