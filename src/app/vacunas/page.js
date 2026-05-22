'use client';
export default function VacunasPage() {

    return (
        <>
            <div className="topbar">
                <h1>Vacunas</h1>
                <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva</button>
            </div>
            <div>
                <h2>Estamos trabajando en esta sección</h2>
                <p>
                    Actualmente estamos desarrollando el módulo de Vacunas para brindarte una mejor experiencia.
                    Muy pronto podrás registrar y gestionar esta información de manera fácil y segura.
                </p>

            </div>
        </>
    );
}