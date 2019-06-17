export class Assets {

	private map: Assets.Map;
	private textures: Map<string, HTMLImageElement>;

	public constructor(map: Assets.Map) {
		this.map = map;
		this.textures = new Map();
	}

	public getTexture(name: string): HTMLImageElement {
		return this.textures.get(name);
	}

	public async load(): Promise<void> {
		let map = this.map;

		if(map.textures) {
			for(const name in map.textures) {
				if(map.textures.hasOwnProperty(name)) {
					const src = map.textures[name];
					const image = await this.loadImage(src);

					this.textures.set(name, image);
				}
			}

			console.log('Textures loaded!');
		}
	}

	private loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise<HTMLImageElement>((resolve: (image: HTMLImageElement) => void, reject: (err: any) => void) => {
			const image = new Image();
			
			image.addEventListener('load', () => resolve(image));
			image.addEventListener('error', () => reject('Error loading texture!'));

			image.src = src;
		});
	}

}

export namespace Assets {

	export interface Map {
		textures?: {
			[key: string]: string
		}
	}

}