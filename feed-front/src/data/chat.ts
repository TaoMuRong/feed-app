enum FromType {
    Me = 1,
    You,
}
let id = 1
export const chatMessages = [
    {
        content: 'some Text',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.Me,
        id: id++,
    },
    {
        content: 'some Text fot ouy',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.You,
        id: id++,
    },
    {
        content: 'I Love',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.You,
        id: id++,
    },
    {
        content: 'me TO',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.Me,
        id: id++,
    },
    {
        content: 'I Love you TO',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.Me,
        id: id++,
    },
    {
        content: 'me TO',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.You,
        id: id++,
    },
    {
        content: 'I Love',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.You,
        id: id++,
    },
    {
        content: 'I Love',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.You,
        id: id++,
    },
    {
        content: 'I Love',
        date: Date.now() - Math.floor(Math.random() * 1000000000),
        from: FromType.You,
        id: id++,
    },
].sort((a, b) => a.date - b.date)

