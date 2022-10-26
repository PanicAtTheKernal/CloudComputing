function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <ArchiveListCard />
                </Col>
            </Row>
        </Container>
    );
}

function ArchiveListCard() {
    const [aitems, setAItems] = React.useState([]);
    const [restore, setRestore] = React.useState(false);
    const [playAnimation, setPlayAnimation] = React.useState(true);

    React.useEffect(() => {
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setAItems([newItem]);
            setPlayAnimation(true);
        },
        [aitems],
    );

    const onItemRestore = React.useCallback(() => {
        setRestore(true);
    });

    const onItemUpdate = React.useCallback(
        item => {
            const index = aitems.findIndex(i => i.id === item.id);
            setAItems([
                ...aitems.slice(0, index),
                item,
                ...aitems.slice(index + 1),
            ]);
        },
        [aitems],
    );

    const setRestoreItem = React.useCallback(e => {
        setRestore(e);
    }, [restore]);

    const onItemRemoval = React.useCallback(
        item => {
            const index = aitems.findIndex(i => i.id === item.id);
            setAItems([...aitems.slice(0, index), ...aitems.slice(index + 1)]);
        },
        [aitems],
    );

    if (aitems === null) return 'Loading...';

    return (
        <React.Fragment>
            <TodoListCard onArchiveItem={onNewItem} restoreItem={restore}/>
            <h1 className="text-center">Bin</h1>
            {aitems.length === 0 && (
                <p className="text-center litext">These cards will be deleted when the app refreshes</p>
            )}
            {aitems.map(item => (
                <ArchiveItemDisplay
                    item={item}
                    key={item.id}
                    onArchiveItem={onItemRestore}
                    onItemRemoval={onItemRemoval}
                    playAnimation={playAnimation}
                    setRestoreItem={setRestoreItem}
                />
            ))}
        </React.Fragment>
    );
}

function TodoListCard({ onArchiveItem, restoreItem, setRestoreItem}) {
    const [items, setItems] = React.useState(null);
    const [playAnimation, setPlayAnimation] = React.useState(false);
    const [achiveItem, setAchiveItem] = React.useState(null);

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            if (restoreItem && achiveItem != null) {
                setNewItem(achiveItem["name"]);
                submitNewItem();
                // setRestoreItem();
            }
            setAchiveItem(null);
        }, 100)
    });

    const submitNewItem = () => {
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };


    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
            setPlayAnimation(true);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
            setAchiveItem(item);
            onArchiveItem(item);
        },
        [items],
    );

    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center litext">You have no todo items yet! Add one above or not ;)</p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                    playAnimation={playAnimation}
                />
            ))}
        </React.Fragment>
    );
}



function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={(process.env.READONLY) ?  () => {}: submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
             	    variant="dark"
	    	    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : ' Add '}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval, playAnimation=false }) {
    const { Container, Row, Col, Button } = ReactBootstrap;
    const [itemCreateAni, setItemCreateAni] = React.useState("itemCreateAnimation");

    React.useEffect(() => {
        setTimeout(() => {
            setItemCreateAni(" ");
          }, 3000);
    }, []);

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item ${(playAnimation) ? itemCreateAni : ""} ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={(process.env.READONLY) ?  () => {}: removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

function ArchiveItemDisplay({ item, onArchiveItem, onItemRemoval, playAnimation=false }) {
    const { Container, Row, Col, Button } = ReactBootstrap;
    const [itemCreateAni, setItemCreateAni] = React.useState("achiveItemCreateAnimation");

    React.useEffect(() => {
        setTimeout(() => {
            setItemCreateAni(" ");
          }, 1000);
    }, []);

    const recoverItem = () => {
        onArchiveItem();
        onItemRemoval(item);
    }

    const removeItem = () => {
        onItemRemoval(item);
    };

    return (
        <Container fluid className={`item ${(playAnimation) ? itemCreateAni : ""} ${item.completed && 'completed'}`}>
            <Row>
                {/* Too buggy to fix  */}
                <Col xs={1} className="text-center">
                    <Button
                        size="sm"
                        variant="link"
                        // onClick={recoverItem}
                        aria-label="Recover item"
                    >
                        {/* <i class="fa fa-trash-restore text-success"></i> */}
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
