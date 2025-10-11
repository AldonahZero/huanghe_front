declare module 'three/examples/jsm/loaders/OBJLoader' {
    import { Loader } from 'three';
    export class OBJLoader extends Loader {
        constructor(manager?: any);
        parse(text: string): any;
        load(url: string, onLoad: (obj: any) => void, onProgress?: any, onError?: any): void;
    }
    export default OBJLoader;
}

declare module 'three/examples/jsm/loaders/FBXLoader' {
    import { Loader } from 'three';
    export class FBXLoader extends Loader {
        constructor(manager?: any);
        parse(buffer: ArrayBuffer): any;
        load(url: string, onLoad: (obj: any) => void, onProgress?: any, onError?: any): void;
    }
    export default FBXLoader;
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import { Loader } from 'three';
    export class GLTFLoader extends Loader {
        constructor(manager?: any);
        parse(buffer: ArrayBuffer, path: string, onLoad: (gltf: any) => void): void;
        load(url: string, onLoad: (gltf: any) => void, onProgress?: any, onError?: any): void;
    }
    export default GLTFLoader;
}
