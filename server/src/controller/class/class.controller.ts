import { CreateClassDto } from '../../dto/class/create-class.dto'
import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid';
import { parse as uuidParse } from 'uuid';

@Controller('class')
export class ClassController {

    @Get()
    getClasses(): string {

	let fileList = "";
	let path = "./classes/";

	let files = fs.readdirSync(path);
	return files.join('\n');
    }

    @Get(':id/name')
    getClassName(@Param() params: any): string {

	let path = "./classes/";

	let files = fs.readdirSync(path);

	let result = "not found"; 

	files.forEach((file) => {
	    let fileContent = fs.readFileSync(`${path}/${file}`, 'utf8');
	    let jsonContent = JSON.parse(fileContent);
	    if (jsonContent.id == params.id) {
		result = jsonContent.name;
		return;
	    }
	});

	return result
    }

    @Get(':id')
    getClass(@Param() params: any): string {

	let path = "./classes/";

	let files = fs.readdirSync(path);

	let result = "not found"; 

	files.forEach((file) => {
	    let fileContent = fs.readFileSync(`${path}/${file}`, 'utf8');
	    let jsonContent = JSON.parse(fileContent);
	    if (jsonContent.id == params.id) {
		result = jsonContent.register;
		return;
	    } });

	return result
    }

    @Post()
    createClass(@Body() createClassDto: CreateClassDto): Uint8Array {
	let date = new Date();

	let id = uuidv4();
	let idArray = uuidParse(id);

	let fileName = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${id}`;
	const filePath = `./classes/${fileName}.data`
	let content = {
	    id: id,
	    date: date.toISOString,
	    name: createClassDto.name
	};
	fs.writeFileSync(filePath, JSON.stringify(content), 'utf8');
	console.log(`File ${content}.file written successfully.`);

	return idArray;
    }
}

