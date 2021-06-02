import { formatRelative } from "date-fns";
import * as _ from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  FiBookmark,
  FiCheck,
  FiDownload,
  FiDownloadCloud,
  FiMenu,
  FiPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../../../components/Button";
import ProjectModelCard from "../../../components/Cards/ProjectModelCard";
import DeleteModal from "../../../components/DeleteModal";
import { TextField } from "../../../components/Forms/TextField";
import { Heading } from "../../../components/Heading";
import LayoutWrapper from "../../../components/LayoutWrapper";
import Modal from "../../../components/Modal";
import ModalBody from "../../../components/Modal/ModalBody";
import ModalFooter from "../../../components/Modal/ModalFooter";
import ModalHeader from "../../../components/Modal/ModalHeader";
import ProjectLayoutWrapper from "../../../components/ProjectLayoutWrapper";
import CrudController from "../../../controllers/CrudController";
import ProjectController from "../../../controllers/ProjectController";
import getCurrentUser from "../../../helpers/getUser";

export default function Home({ user, token, project }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectModelDelete, setProjectModelDelete] = useState(null);
  const [parentName, setParentName] = useState("");
  const [parentError, setParentError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loadedProject, setLoadedProject] = useState(project);

  const handleKeydownEvent = async (e) => {
    if (!(e.key === "Enter") || parentName.length < 2) return;

    await createParent();
  };

  const refreshProject = async () => {
    const newProject = await ProjectController.show(token, project.id);
    setLoadedProject(newProject);
  };

  const createParent = async () => {
    setParentError(null);
    setLoading(true);
    const data = await CrudController.addParent(parentName, project.id, token);
    setLoading(false);

    if (data.error) {
      setParentError(data.error);
      setLoading(false);
      return;
    }

    await refreshProject();
    setIsOpen(false);

    await toast.success("Pai adicionado com sucesso!");
  };

  const openDeleteProjectModel = (projectModel) => {
    setProjectModelDelete(projectModel);
    setIsDeleteOpen(true);
  };

  const deleteProjectModel = async () => {
    setLoading(true);
    await CrudController.removeProjectModel(projectModelDelete.id, token);
    setLoading(false);
    setIsDeleteOpen(false);
    await refreshProject();
    await toast.success("Item removido com sucesso");
  };

  return (
    <>
      <Head>
        <title>Tempus | Projects</title>
      </Head>

      <DeleteModal
        title="Remover item"
        message="Tem a certeza que pretende remover"
        isOpen={isDeleteOpen}
        isLoading={loading}
        onDelete={deleteProjectModel}
        setIsOpenCallable={setIsDeleteOpen}
      />

      <Modal
        isOpen={isOpen}
        onOutsideClick={() => {
          setIsOpen(false);
        }}
      >
        <ModalHeader>
          <Heading size="h2" weight="bold">
            Novo Pai
          </Heading>
        </ModalHeader>
        <ModalBody>
          <TextField
            name="name"
            onChange={setParentName}
            error={parentError}
            label="Nome do Pai"
            onKeyDown={handleKeydownEvent}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            loading={loading}
            color={"primary"}
            disabled={parentName.length < 2}
            className=""
            onClick={createParent}
          >
            Criar
          </Button>
          <Button
            className=""
            color="secondary"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      <ProjectLayoutWrapper user={user} project={loadedProject}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-14 ">
          <Heading size="h2" weight="bold">
            {loadedProject.name}
          </Heading>

          <div className="md:flex gap-8">
            <Button
              className="w-full mt-4 md:w-1/3 lg:w-48 md:mt-0"
              color="primary"
              onClick={() => {
                router.push(`${project.id}/new`);
              }}
              icon={<FiPlus />}
            >
              Novo CRUD
            </Button>
            <Button
              className="w-full mt-4 md:w-1/3 lg:w-48 md:mt-0"
              color="primary"
              onClick={() => {
                setIsOpen(true);
              }}
              icon={<FiBookmark />}
            >
              Novo Pai
            </Button>
          </div>
        </div>
        <div className="gap-8">
          {loadedProject.menu
            .filter((value) => value.project_model_id === null)
            .map((item) => (
              <div className="my-8">
                <ProjectModelCard
                  projectModel={item}
                  onDelete={() => {
                    openDeleteProjectModel(item);
                  }}
                />

                {item.project_models.map((child) => (
                  <div className="my-8 ml-20">
                    <ProjectModelCard
                      projectModel={child}
                      onDelete={() => {
                        openDeleteProjectModel(item);
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>
      </ProjectLayoutWrapper>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { user, token } = await getCurrentUser(ctx);
  const { id } = ctx.query;

  const project = await ProjectController.show(token, id);

  if (!project) {
    return {
      notFound: true,
    };
  }

  return { props: { user: user, token: token, project: project } };
}
