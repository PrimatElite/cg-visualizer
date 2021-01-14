export function createAccordionItem(parent, name, body, id) {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header" id={`${id}_head`}>
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target={`#${id}`} aria-expanded="false" aria-controls={`${id}`}>
                    {name}
                </button>
            </h2>
            <div id={`${id}`} className="accordion-collapse collapse" aria-labelledby={`${id}_head`}
                 data-bs-parent={`#${parent}`}>
                <div className="accordion-body">
                    {body}
                </div>
            </div>
        </div>
    );
}

export function createAccordion(id, children) {
    return (
        <div className="accordion accordion-flush" id={id}>
            {children}
        </div>
    );
}