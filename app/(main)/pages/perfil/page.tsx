/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Projeto } from '@/types';
import { PerfilService } from '@/service/PerfilService';

const Perfil = () => {
    let perfilVazio: Projeto.Perfil = {
        descricao: ''
    };

    const [perfils, setPerfils] = useState<Projeto.Perfil[]>([]);
    const [perfilDialog, setPerfilDialog] = useState(false);
    const [deletePerfilDialog, setDeletePerfilDialog] = useState(false);
    const [deletePerfilsDialog, setDeletePerfilsDialog] = useState(false);
    const [perfil, setPerfil] = useState<Projeto.Perfil>(perfilVazio);
    const [selectedPerfils, setSelectedPerfils] = useState<Projeto.Perfil[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const perfilService = useMemo(() => new PerfilService(), []);

    const carregarPerfils = () => {
        perfilService.listarTodos()
            .then((response) => setPerfils(response.data))
            .catch((error) => console.log(error));
    };

    useEffect(() => {
        carregarPerfils();
    }, []);

    const openNew = () => {
        setPerfil(perfilVazio);
        setSubmitted(false);
        setPerfilDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPerfilDialog(false);
    };

    const hideDeletePerfilDialog = () => setDeletePerfilDialog(false);
    const hideDeletePerfilsDialog = () => setDeletePerfilsDialog(false);

    const savePerfil = () => {
        setSubmitted(true);

        if (!perfil.id) {
            perfilService.inserir(perfil)
                .then(() => {
                    setPerfilDialog(false);
                    setPerfil(perfilVazio);
                    carregarPerfils();
                    toast.current?.show({ severity: 'info', summary: 'Sucesso', detail: 'Perfil cadastrado com sucesso!' });
                })
                .catch(() => toast.current?.show({ severity: 'error', summary: 'Erro!', detail: 'Erro ao salvar!' }));
        } else {
            perfilService.alterar(perfil)
                .then(() => {
                    setPerfilDialog(false);
                    setPerfil(perfilVazio);
                    carregarPerfils();
                    toast.current?.show({ severity: 'info', summary: 'Sucesso', detail: 'Perfil alterado com sucesso!' });
                })
                .catch(() => toast.current?.show({ severity: 'error', summary: 'Erro!', detail: 'Erro ao alterar!' }));
        }
    };

    const editPerfil = (perfil: Projeto.Perfil) => {
        setPerfil({ ...perfil });
        setPerfilDialog(true);
    };

    const confirmDeletePerfil = (perfil: Projeto.Perfil) => {
        setPerfil(perfil);
        setDeletePerfilDialog(true);
    };

    const deletePerfil = () => {
        if (perfil.id) {
            perfilService.excluir(perfil.id)
                .then(() => {
                    setPerfil(perfilVazio);
                    setDeletePerfilDialog(false);
                    carregarPerfils();
                    toast.current?.show({ severity: 'success', summary: 'Sucesso!', detail: `Perfil: ${perfil.descricao} deletado com sucesso!`, life: 3000 });
                })
                .catch(() => toast.current?.show({ severity: 'error', summary: 'Erro!', detail: 'Erro ao deletar!', life: 3000 }));
        }
    };

    const deleteSelectedPerfils = () => {
        Promise.all(selectedPerfils.map(async (_perfil) => {
            if (_perfil.id) await perfilService.excluir(_perfil.id);
        }))
            .then(() => {
                carregarPerfils();
                setDeletePerfilsDialog(false);
                toast.current?.show({ severity: 'success', summary: 'Sucesso!', detail: 'Perfis deletados com sucesso!', life: 3000 });
            })
            .catch(() => toast.current?.show({ severity: 'error', summary: 'Erro!', detail: 'Erro ao deletar perfis!', life: 3000 }));
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = e.target.value || '';
        const _perfil = { ...perfil };
        _perfil[name] = val;
        setPerfil(_perfil);
    };

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="Novo" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={() => setDeletePerfilsDialog(true)} disabled={!selectedPerfils.length} />
        </div>
    );

    const rightToolbarTemplate = () => (
        <>
            <FileUpload mode="basic" accept=".csv" maxFileSize={1000000} chooseLabel="Importar" className="mr-2 inline-block" />
            <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={() => dt.current?.exportCSV()} />
        </>
    );

    const idBodyTemplate = (rowData: Projeto.Perfil) => <>{rowData.id}</>;
    const descricaoBodyTemplate = (rowData: Projeto.Perfil) => <>{rowData.descricao}</>;

    const actionBodyTemplate = (rowData: Projeto.Perfil) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPerfil(rowData)} />
            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePerfil(rowData)} />
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Perfis</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const perfilDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={savePerfil} />
        </>
    );
    const deletePerfilDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePerfilDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deletePerfil} />
        </>
    );
    const deletePerfilsDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePerfilsDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedPerfils} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={perfils}
                        selection={selectedPerfils}
                        onSelectionChange={(e) => setSelectedPerfils(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} perfis"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum perfil encontrado."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="descricao" header="Descrição" sortable body={descricaoBodyTemplate} headerStyle={{ minWidth: '20rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={perfilDialog} style={{ width: '450px' }} header="Detalhes do Perfil" modal className="p-fluid" footer={perfilDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="descricao">Descrição</label>
                            <InputText
                                id="descricao"
                                value={perfil.descricao}
                                onChange={(e) => onInputChange(e, 'descricao')}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !perfil.descricao })}
                            />
                            {submitted && !perfil.descricao && <small className="p-invalid">Descrição é obrigatória.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePerfilDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePerfilDialogFooter} onHide={hideDeletePerfilDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {perfil && <span>Você realmente deseja excluir o perfil <b>{perfil.descricao}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePerfilsDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePerfilsDialogFooter} onHide={hideDeletePerfilsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {perfil && <span>Você realmente deseja excluir os perfis selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Perfil;