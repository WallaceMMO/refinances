import { getRepository, Repository } from "typeorm";
import { NextFunction, Request, Response } from "express";

import { User } from "../entities/User";
import { Config } from "../entities/Config";

class ConfigController {
  async all(request: Request, response: Response, next: NextFunction) {
    const configRepository = getRepository(Config);
    const config = await configRepository.find();

    return response.send({ config });
  }

  async showRelations(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const configRepository = getRepository(Config);

    const config = await configRepository
      .createQueryBuilder("config")
      .leftJoinAndSelect("config.userConfig", "user")
      .getMany();

    return response.send({ config });
  }

  async save(request: Request, response: Response, next: NextFunction) {
    const configRepository = getRepository(Config);
    const userRepository = getRepository(User);

    const {
      fingerprint,
      theme,
      senha,
      idioma,
      userIdid,
    } = request.body;

    
    const user = await userRepository.findOne({
      where: { id: userIdid },
    });

    if (!user)
      return response.send({
        error: "Não existe esse id de user",
      });      
      
    const newConfig = request.body;
    newConfig.userIdid = user;
    
    const config = configRepository.create(newConfig);
    await configRepository.save(config);

    return response.send({ config: config });
  }

  async FindByUser(request: Request, response: Response, next: NextFunction) {
    const metaRepository = getRepository(Config);
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: request.params.iduser,
      },
    });

    if (!user) {
      return response.send({ error: "usuário não encontrado" });
    }

    const config = await metaRepository.createQueryBuilder("config")
      .select(["config", "user.id"])
      .leftJoin("config.userIdid", "user")
      .where("user.id = :id", {id: user.id})
      .getMany()

    console.log(config)

    return response.send({ config });
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const configRepository = getRepository(Config);
    
    const config = await configRepository.createQueryBuilder("config")            
      .where("config.id = :id", {id: request.params.id})
      .getOne()

    return response.send({ config });
  }

  async edit(request: Request, response: Response, next: NextFunction) {
    const configRepository = getRepository(Config);
    const userRepository = getRepository(User);

    const {
      fingerprint,
      theme,
      senha,
      idioma,
      userIdid,
    } = request.body;
    const id = parseInt(request.params.id);

    if (fingerprint == "") return response.send({ error: "FingerPrint vazio!" });
    if (theme == "")
      return response.send({ error: "Tema vazio" });
    if (senha == "")
      return response.send({ error: "Senha não inserido!" });
    if (idioma == "")
      return response.send({ error: "Idioma não inserido!" });

    const userExists = await userRepository.findOne({
      where: { id: userIdid },
    });

    if (!userExists)
      return response.send({
        //error: "Não existe esse user aí",
      });

    const updateConfig = request.body;
    updateConfig.userIdid = userExists;

    await configRepository.update(id, updateConfig);
    const config = await configRepository.findOne({ where: { id } });

    return response.send({ message: "atualizou a config " + config });
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const configRepository = getRepository(Config);
    let configToRemove = await configRepository.findOne(request.params.id);
    await configRepository.remove(configToRemove);
    return response.send({ mes: "foi" });
  }
  

  async removeAll(request: Request, response: Response, next: NextFunction) {
    const configRepository = getRepository(Config);
    let configToRemove = await configRepository.find();
    await configRepository.remove(configToRemove);

    return response.send({ mes: "foi" });
  }
}

export default new ConfigController();
