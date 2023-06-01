import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

type MessageType = 'info' | 'success' | 'warn' | 'error';

type NoticeParams = {
    content: string;
    duration: number;
    type: MessageType;
};

let div: HTMLDivElement;

function notice(args: NoticeParams) {
    if (!div) {
        div = document.createElement('div');
        div.id = 'mm-message';
        document.body.appendChild(div);
    }
    document.body.appendChild(div);
    return ReactDOM.render(<Message {...args} />, div);
}

let timer: NodeJS.Timer;

function Message(props: NoticeParams) {
    const [msgs, setMsgs] = useState([]);
    const { content, type, duration } = props;

    const iconObj = {
        info: 'mf-icon-information',
        success: ' mf-icon-selected2',
        warn: 'mf-icon-Prompt',
        error: ' mf-icon-remove',
    };

    useEffect(() => {
        setMsgs([...msgs, props]);
    }, [props]);

    useEffect(() => {
        if (msgs.length) {
            let msgsCopy = JSON.parse(JSON.stringify(msgs));

            clearInterval(timer);
            timer = setInterval(
                setMsgs => {
                    msgsCopy.shift();
                    setMsgs(JSON.parse(JSON.stringify(msgsCopy)));
                    if (!msgsCopy.length) {
                        clearInterval(timer);
                    }
                },
                duration * 1000,
                setMsgs
            );
        }
    }, [msgs]);

    return (
        <div className="mm-message">
            {msgs.map((item, index) => {
                return (
                    <div className="mm-message-content" key={index}>
                        <i className={`${iconObj[type]} mm-message-content-icon`}></i>
                        <span className="mm-message-content-text">{content}</span>
                    </div>
                );
            })}
        </div>
    );
}

let api: Partial<Record<MessageType, (content: string, duration?: number) => void>> = {};

const types: MessageType[] = ['info', 'success', 'warn', 'error'];

types.forEach(type => {
    api[type] = (content: string, duration = 3) => {
        return notice({ content, duration, type });
    };
});

export default api;
