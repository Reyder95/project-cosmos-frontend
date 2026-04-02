const Tools = {
    SELECT: 'select',
    STAR: 'star',
    LINK: 'link',
    REGION: 'region',
    ERASER: 'eraser'
}

type Tools = typeof Tools[keyof typeof Tools];

export {
    Tools
}