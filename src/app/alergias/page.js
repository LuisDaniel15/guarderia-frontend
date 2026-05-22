'use client';
export default function AlergiasPage() {

    return (
        <>
            <div className="topbar">
                <h1>Alergias</h1>
                <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva</button>
            </div>
            <div>
                <h2>Estamos trabajando en esta sección</h2>
                <p>
                    Actualmente estamos desarrollando el módulo de alergias para brindarte una mejor experiencia.
                    Muy pronto podrás registrar y gestionar esta información de manera fácil y segura.
                </p>

            </div>
        </>
    );
}